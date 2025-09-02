import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
interface FBApiParams {
  fields?: string;
  [key: string]: string | undefined; // cho các trường khác nếu cần
}

interface FBApiPictureData {
  data: {
    url: string;
  };
}

interface FBApiResponse {
  id: string;
  name: string;
  email?: string;
  picture?: FBApiPictureData;
  [key: string]: unknown; // các trường khác FB trả về
}

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: {
      init: (params: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: FBLoginResponse) => void,
        options?: { scope?: string }
      ) => void;
      getLoginStatus: (
        callback: (response: FBLoginResponse) => void
      ) => void;
      api: (path: string, params: FBApiParams, callback: (response: FBApiResponse) => void) => void;

    };
  }

  interface FBUserInfo {
    id: string;
    name: string;
    email?: string;
    picture?: {
      data: {
        url: string;
      };
    };
  }

  interface FBLoginResponse {
    status: "connected" | "not_authorized" | "unknown";
    authResponse?: {
      accessToken: string;
      userID: string;
      expiresIn: number;
      signedRequest: string;
      data_access_expiration_time: number;
    };
  }
}

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // 🔹 Load Facebook SDK
  useEffect(() => {
    if (window.FB) return;

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "1116185167112470",
        cookie: true,
        xfbml: true,
        version: "v17.0",
      });
    };

    (function (d, s, id) {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      const js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode?.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, []);

  // 🔹 Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🔹 Email/password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3000/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại!");

      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("userName", data.user.name || ""); // Lưu tên nếu backend gửi
      localStorage.setItem("userAvatar", data.user.avatar || ""); // Lưu avatar nếu có
      window.location.href = "/";
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Google login
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Không nhận được token từ Google");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3000/api/user/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(`${data.message || "Google login thất bại"}${data.error ? ` - ${data.error}` : ""}`);

      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("userName", data.user.name || "");
      localStorage.setItem("userAvatar", data.user.avatar || "");
      window.location.href = "/";
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => setError("Đăng nhập Google thất bại, vui lòng thử lại!");

  // 🔹 Facebook login
  const handleFacebookLogin = () => {
    setError(null);
    setIsLoading(true);

    window.FB.login((response: FBLoginResponse) => {
      (async () => {
        if (response.status !== "connected" || !response.authResponse) {
          setError("Đăng nhập Facebook thất bại hoặc hủy đăng nhập");
          setIsLoading(false);
          return;
        }

        const { accessToken } = response.authResponse;

        // Lấy thông tin user từ Facebook
        window.FB.api(
          "/me",
          { fields: "id,name,email,picture" },
          async (userInfo: FBUserInfo) => {
            try {
              const res = await fetch("http://localhost:3000/api/user/facebook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: accessToken }),
              });

              const data = await res.json();
              if (!res.ok) throw new Error(data.message || "Facebook login thất bại!");

              // Lưu token + thông tin user
              localStorage.setItem("token", data.token);
              localStorage.setItem("email", userInfo.email || "");
              localStorage.setItem("userName", userInfo.name || "");
              localStorage.setItem("userAvatar", userInfo.picture?.data?.url || "");
              window.location.href = "/";
            } catch (err: unknown) {
              if (err instanceof Error) setError(err.message);
              else setError("Có lỗi xảy ra, vui lòng thử lại!");
            } finally {
              setIsLoading(false);
            }
          }
        );
      })();
    }, { scope: "email,public_profile" });
  };

  return (
    <AuthLayout title="Đăng Nhập" subtitle="Chào mừng bạn quay trở lại với VinFast">
      <form onSubmit={handleSubmit} className="space-y-7">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Email & Password */}
        <div className="space-y-3">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-800">Địa chỉ Email</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập địa chỉ email của bạn"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-800">Mật khẩu</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-12 pr-14 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl"
              placeholder="Nhập mật khẩu của bạn"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center">
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded-lg"
            />
            <span className="ml-3 text-sm font-medium text-gray-700">Ghi nhớ đăng nhập</span>
          </label>
          <button type="button" className="text-sm text-blue-600 font-semibold">Quên mật khẩu?</button>
        </div>

        {/* Login buttons */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center space-x-3"
        >
          {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
        </button>

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-600 font-medium">Hoặc đăng nhập với</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-1 gap-4">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
          <button
            type="button"
            onClick={handleFacebookLogin}
            className="w-full bg-blue-800 text-white py-3 rounded-2xl font-bold"
          >
            Đăng nhập với Facebook
          </button>
        </div>

        {/* Register */}
        <div className="text-center pt-4">
          <p className="text-gray-600">
            Chưa có tài khoản?{" "}
            <button type="button" className="font-bold text-blue-600" onClick={() => (window.location.href = "/register")}>
              Đăng ký ngay
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginForm;
