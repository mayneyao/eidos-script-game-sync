/// <reference path="eidos.d.ts" />

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
    const getGames = (url: string): Promise<IGameItem[]> => {
      return fetch(url)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          allGames = allGames.concat(data.results);
          if (data.next) {
            return getGames(data.next);
          } else {
            return allGames;
          }
        });
    };
    return getGames(startUrl);
  };

  const games = await getAllMyGames(context.env.username);

  const tableName = context.tables.game.name;
  const fieldMap = context.tables.game.fieldsMap;
  for (const game of games) {
    const { name, slug, background_image, released } = game;
    await eidos.currentSpace.addRow(tableName, {
      [fieldMap.name]: name,
      [fieldMap.slug]: slug,
      [fieldMap.background_image]: background_image,
      [fieldMap.released]: released,
    });
  }
}
