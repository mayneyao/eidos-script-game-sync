/// <reference path="eidos.d.ts" />
export default async function (_input, context) {
    const getAllMyGames = (userName) => {
        let allGames = [];
        let startUrl = `https://api.rawg.io/api/users/${userName}/games?page=1`;
        const getGames = (url) => {
            return fetch(url)
                .then((res) => {
                return res.json();
            })
                .then((data) => {
                allGames = allGames.concat(data.results);
                if (data.next) {
                    return getGames(data.next);
                }
                else {
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
