import Link from "next/link";

function Game({ params }: { params: { game: string } }) {
  return (
    <div>
      <h1>Game {params.game}</h1>
      <Link href="/user">User</Link>
    </div>
  );
}

export default Game;
