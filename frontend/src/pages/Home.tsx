import { Navigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";

type Props = { authed: boolean };

const errorMessage = (code: string | null): string | null => {
  switch (code) {
    case "invalid_state":
      return "認証リクエストの検証に失敗しました。もう一度お試しください。";
    case "oauth_failed":
      return "Discord 認証に失敗しました。";
    default:
      return null;
  }
};

export const Home = ({ authed }: Props) => {
  const [params] = useSearchParams();

  if (authed) {
    return <Navigate to="/dashboard" replace />;
  }

  const err = errorMessage(params.get("error"));

  return (
    <main className="center">
      <h1>Discord Auth Template</h1>
      <p>Discord アカウントでサインインしてください。</p>
      {err && <p className="error">{err}</p>}
      <a className="btn btn-discord" href={api.loginUrl()}>
        Login with Discord
      </a>
    </main>
  );
};
