<?php
use Illuminate\Database\Seeder;
use App\Models\UserModel;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        UserModel::updateOrCreate(
            ['email' => 'superadmin@mail.com'],
            [
                'nama' => 'Super Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'lokasi' => 'HO',
                'approval_status' => 'approved',
                'is_active' => 1,
            ]
        );
    }
}