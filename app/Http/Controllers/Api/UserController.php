<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserModel;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * ======================
     * LIST USER
     * ======================
     */
    public function index()
    {
        $users = UserModel::latest()->get()->map(function ($user) {
            return $this->formatUser($user);
        });

        return response()->json([
            'status' => true,
            'data'   => $users
        ]);
    }

    /**
     * ======================
     * CREATE USER (ADMIN)
     * ======================
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nama'     => 'required|string',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role'     => 'required|string',
            'lokasi'   => 'nullable|string',
        ]);

        $user = UserModel::create([
            'nama'            => $data['nama'],
            'email'           => $data['email'],
            'password'        => Hash::make($data['password']),
            'role'            => $data['role'],
            'lokasi'          => $data['lokasi'] ?? null,

            // 🔥 DEFAULT SESUAI DESAIN BARU
            'approval_status' => 'approved', // karena dibuat admin
            'is_active'       => 1,
        ]);

        return response()->json([
            'status' => true,
            'data'   => $this->formatUser($user)
        ], 201);
    }

    /**
     * ======================
     * DETAIL USER
     * ======================
     */
    public function show($id)
    {
        $user = UserModel::findOrFail($id);

        return response()->json([
            'status' => true,
            'data'   => $this->formatUser($user)
        ]);
    }

    /**
     * ======================
     * UPDATE DATA USER
     * ======================
     */
    public function update(Request $request, $id)
    {
        $user = UserModel::findOrFail($id);

        $data = $request->validate([
            'nama'   => 'sometimes|string',
            'email'  => 'sometimes|email|unique:users,email,' . $id,
            'role'   => 'sometimes|string',
            'lokasi' => 'nullable|string',
        ]);

        $user->update($data);

        return response()->json([
            'status' => true,
            'data'   => $this->formatUser($user)
        ]);
    }

    /**
     * ======================
     * APPROVE USER
     * ======================
     */
    public function approve($id)
    {
        $user = UserModel::findOrFail($id);

        $user->approval_status = 'approved';
        $user->is_active = 1;
        $user->save();

        return response()->json([
            'status'  => true,
            'message' => 'User berhasil di-approve',
            'data'    => $this->formatUser($user)
        ]);
    }

    /**
     * ======================
     * REJECT USER
     * ======================
     */
    public function reject($id)
    {
        $user = UserModel::findOrFail($id);

        $user->approval_status = 'rejected';
        $user->is_active = 0;
        $user->save();

        return response()->json([
            'status'  => true,
            'message' => 'User berhasil di-reject',
            'data'    => $this->formatUser($user)
        ]);
    }

    /**
     * ======================
     * AKTIFKAN USER (SETELAH APPROVED)
     * ======================
     */
    public function activate($id)
    {
        $user = UserModel::findOrFail($id);

        if ($user->approval_status !== 'approved') {
            return response()->json([
                'message' => 'User belum disetujui'
            ], 400);
        }

        $user->is_active = 1;
        $user->save();

        return response()->json([
            'status'  => true,
            'message' => 'User diaktifkan',
            'data'    => $this->formatUser($user)
        ]);
    }

    /**
     * ======================
     * NONAKTIFKAN USER
     * ======================
     */
    public function deactivate($id)
    {
        $user = UserModel::findOrFail($id);

        $user->is_active = 0;
        $user->save();

        return response()->json([
            'status'  => true,
            'message' => 'User dinonaktifkan',
            'data'    => $this->formatUser($user)
        ]);
    }

    /**
     * ======================
     * FORMAT RESPONSE USER
     * ======================
     */
    protected function formatUser($user)
    {
        return [
            'id'              => $user->id,
            'nama'            => $user->nama,
            'email'           => $user->email,
            'role'            => $user->role,
            'lokasi'          => $user->lokasi,

            // 🔥 STATUS BARU
            'approval_status' => $user->approval_status,
            'is_active'       => (bool) $user->is_active,

            'email_verified'  => !is_null($user->email_verified_at),
            'created_at'      => $user->created_at,
            'updated_at'      => $user->updated_at,
        ];
    }
}