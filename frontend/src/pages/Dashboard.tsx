import type { Me } from "../api/client";

type Props = {
  user: Me;
  onLogout: () => void;
};

export const Dashboard = ({ user, onLogout }: Props) => {
  return (
    <main className="center">
      <h1>Welcome, {user.globalName ?? user.username}</h1>
      {user.avatarUrl && (
        <img src={user.avatarUrl} alt="avatar" className="avatar" />
      )}
      <dl className="info">
        <dt>Username</dt>
        <dd>{user.username}</dd>
        <dt>Discord ID</dt>
        <dd>{user.discordId}</dd>
        {user.email && (
          <>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </>
        )}
      </dl>
      <button className="btn" onClick={onLogout}>
        Logout
      </button>
    </main>
  );
};
