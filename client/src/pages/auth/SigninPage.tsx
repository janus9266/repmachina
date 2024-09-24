import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { User } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

const SignInPage = () => {
  const { login } = useAuth();

  const navigate = useNavigate();

  const handleSuccess = async (response: any) => {
    try {
      const token = response.credential;
      if (token) {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "token": `${token}`,
            }),
          }
        );

        const resParsed = await res.json();
        const decoded = jwtDecode<User>(resParsed.access_token);

        localStorage.setItem('access_token', resParsed.access_token);
        login(decoded);

        navigate('/');
      }
    } catch (error) {
      console.error('Error login: ', error)
    }
  };

  const handleFailure = () => {
    alert('Goolge OAuth login failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId={`${process.env.REACT_APP_GOOGLE_CLIENT_ID}`}>
      <div className="flex min-h-screen items-center">
        <div className="flex justify-center w-full text-white">
          <div className="relative overflow-hidden xl:block xl:w-1/3">
            <div className="mt-24">
              <img
                src="/images/grids/grid-01.svg"
                alt="Logo"
                width={405}
                height={325}
                className="mx-auto dark:opacity-30"
              />
            </div>

            <div className="absolute top-0">
              <a className="mb-10 inline-block" href="/">
                <img
                  className=""
                  src="/logo.png"
                  alt="Logo"
                  width={320}
                  height={26}
                />
              </a>
              <p className="mb-4 text-xl font-medium">
                Sign in to your account
              </p>

              <h1 className="mb-4 text-4xl font-bold sm:text-heading-3">
                Welcome Back!
              </h1>

              <p className="w-full max-w-[375px] font-medium text-gray-400 text-xl">
                Please sign in to your account by completing the necessary fields below
              </p>
            </div>

            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleFailure}
            />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignInPage;