import Link from "next/link";

function User() {
  return (
    <div>
      <h1>User</h1>
      <Link href="/">Home</Link>
      <h2>My games</h2>
      <Link href="/games/1">Game 1</Link>
      <Link href="/games/2">Game 2</Link>
      <Link href="/games/3">Game 3</Link>
    </div>
  );
}

export default User;
