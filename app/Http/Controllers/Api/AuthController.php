<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * ======================
     * LOGIN
     * ======================
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        // Cek email & password
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email atau password salah'
            ], 401);
        }

        $user = Auth::user();

        /**
         * 🔥 CEK APPROVAL DULU
         */
        if ($user->approval_status !== 'approved') {
            return response()->json([
                'message' => 'Akun belum disetujui admin'
            ], 403);
        }

        /**
         * 🔥 CEK AKTIF / NONAKTIF
         */
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Akun sedang dinonaktifkan'
            ], 403);
        }

        // Generate token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $this->formatUser($user),
            'token' => $token
        ]);
    }

    /**
     * ======================
     * REGISTER
     * ======================
     */
    public function register(Request $request)
    {
        $request->validate([
            'nama'     => 'required|string',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'lokasi'   => 'required|string',
        ]);

        $user = UserModel::create([
            'nama'            => $request->nama,
            'email'           => $request->email,
            'password'        => Hash::make($request->password),
            'role'            => 'user',
            'lokasi'          => $request->lokasi,

            // 🔥 DEFAULT BARU
            'approval_status' => 'pending',
            'is_active'       => 0,
        ]);

        return response()->json([
            'message' => 'Pendaftaran berhasil. Menunggu persetujuan admin.'
        ], 201);
    }

    /**
     * ======================
     * CURRENT USER (/auth/me)
     * ======================
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $this->formatUser($request->user())
        ]);
    }

    /**
     * ======================
     * LOGOUT
     * ======================
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }

    /**
     * ======================
     * RESET PASSWORD VIA EMAIL
     * ======================
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json([
            'message' => 'Email reset password telah dikirim'
        ]);
    }

    /**
     * ======================
     * FORMAT USER (MATCH FE)
     * ======================
     */
    private function formatUser(UserModel $user): array
    {
        return [
            'id'              => (string) $user->id,
            'nama'            => $user->nama,
            'email'           => $user->email,
            'role'            => $user->role,
            'lokasi'          => $user->lokasi,

            // 🔥 KIRIM DUA STATUS
            'approval_status' => $user->approval_status,
            'is_active'       => (bool) $user->is_active,

            'email_verified'  => !is_null($user->email_verified_at),
            'auth_provider'   => 'local',
            'image_url'       => $user->image_url ?? null,
            'created_at'      => $user->created_at,
            'updated_at'      => $user->updated_at,
        ];
    }
}