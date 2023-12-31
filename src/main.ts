import { Eidos, EidosTable } from "@eidos.space/types";
declare const eidos: Eidos;

interface Env {
  // add your environment variables here
  username: string;
}

interface IGameItem {
  name: string;
  slug: string;
  background_image: string;
  released: string;
}

interface Table {
  // add your tables here
  game: EidosTable<IGameItem>;
}

interface Input {
  // add your input fields here
}

interface Context {
  env: Env;
  tables: Table;
  currentRowId?: string;
}

export default async function (_input: Input, context: Context) {
  const getAllMyGames = (userName: string) => {
    let allGames: IGameItem[] = [];
    let startUrl = `https://api.rawg.io/api/users/${userName}/games?page=1`;
    const getGames = async (url: string): Promise<IGameItem[]> => {
      const resp = await fetch(url);
      const data = await resp.json();
      allGames = allGames.concat(data.results);
      if (data.next) {
        return getGames(data.next);
      } else {
        return allGames;
      }
    };
    return getGames(startUrl);
  };

  const games = await getAllMyGames(context.env.username);

  const tableId = context.tables.game.id;
  const fieldMap = context.tables.game.fieldsMap;
  const oldGames: IGameItem[] = await eidos.currentSpace
    .table(tableId)
    .rows.query();

  for (const game of games) {
    const { name, slug, background_image, released } = game;
    const existingGame = oldGames.find((g) => g.slug === slug);
    if (existingGame) {
      continue;
    }
    await eidos.currentSpace.table(tableId).rows.create(
      {
        [fieldMap.name]: name,
        [fieldMap.slug]: slug,
        [fieldMap.background_image]: background_image,
        [fieldMap.released]: released,
      },
      { useFieldId: true }
    );
  }
}
