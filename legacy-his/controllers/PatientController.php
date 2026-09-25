<?php

namespace app\controllers;

use app\models\Patient;
use Yii;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\web\UnauthorizedHttpException;

class PatientController extends Controller
{
    // APIs are called by programs, not browser forms, so CSRF tokens don't apply
    public $enableCsrfValidation = false;

    // Runs BEFORE every action: check the API key (like a NestJS guard)
    public function beforeAction($action): bool
    {
        $key = Yii::$app->request->headers->get('X-Api-Key', '');
        // hash_equals compares safely (prevents "timing attacks")
        if (!hash_equals(Yii::$app->params['apiKey'], $key)) {
            throw new UnauthorizedHttpException('Invalid API key');
        }
        return parent::beforeAction($action);
    }

    // GET /patients        (optional: ?q=name to search)
    public function actionIndex(): array
    {
        $query = Patient::find()->orderBy(['id' => SORT_ASC])->limit(500);

        $q = Yii::$app->request->get('q');
        if ($q) {
            $query->andWhere(['like', 'nama', $q]); // safe: Yii escapes $q for us
        }

        return ['data' => $query->asArray()->all()];
    }

    // GET /patients/5
    public function actionView(int $id): array
    {
        return ['data' => $this->findPatient(['id' => $id])];
    }

    // GET /patients/by-ic/850612-10-1234
    public function actionByIc(string $noKp): array
    {
        return ['data' => $this->findPatient(['no_kp' => $noKp])];
    }

    // POST /patients   body: {"nama": "...", "no_kp": "...", "telefon": "..."}
    public function actionCreate(): array
    {
        $patient = new Patient();
        $patient->load(Yii::$app->request->bodyParams, '');

        if (!$patient->save()) {
            Yii::$app->response->statusCode = 422; // Unprocessable: validation failed
            return ['errors' => $patient->errors];
        }

        Yii::$app->response->statusCode = 201;
        $patient->refresh(); // reload to get dicipta_pada from the database
        return ['data' => $patient];
    }

    private function findPatient(array $condition): Patient
    {
        $patient = Patient::findOne($condition);
        if ($patient === null) {
            throw new NotFoundHttpException('Pesakit tidak dijumpai'); // 404
        }
        return $patient;
    }
}