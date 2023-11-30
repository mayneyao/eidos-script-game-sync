// src/main.ts
async function main_default(_input, context) {
  const getAllMyGames = (userName) => {
    let allGames = [];
    let startUrl = `https://api.rawg.io/api/users/${userName}/games?page=1`;
    const getGames = async (url) => {
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
  const oldGames = await eidos.currentSpace.table(tableId).rows.query();
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
        [fieldMap.released]: released
      },
      { useFieldId: true }
    );
  }
}
export {
  main_default as default
};
