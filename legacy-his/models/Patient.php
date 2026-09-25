<?php

namespace app\models;

use yii\db\ActiveRecord;

/**
 * One row of the legacy "pesakit" table.
 *
 * @property int $id
 * @property string $nama
 * @property string $no_kp
 * @property string|null $telefon
 * @property string $dicipta_pada
 */
class Patient extends ActiveRecord
{
    public static function tableName(): string
    {
        return 'pesakit';
    }

    // Validation rules (like a NestJS DTO)
    public function rules(): array
    {
        return [
            [['nama', 'no_kp'], 'required'],
            [['nama'], 'string', 'max' => 150],
            [['no_kp'], 'match', 'pattern' => '/^\d{6}-\d{2}-\d{4}$/', 'message' => 'No. KP mesti seperti 900101-14-5678'],
            [['no_kp'], 'unique'],
            [['telefon'], 'string', 'max' => 20],
        ];
    }
}