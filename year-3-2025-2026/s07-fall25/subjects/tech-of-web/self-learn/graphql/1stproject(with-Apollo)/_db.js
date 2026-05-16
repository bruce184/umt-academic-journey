let games = [
    { id: '1', title: 'The Legend of Zelda: Breath of the Wild', platform: ['Nintendo Switch', 'Wii U'] },
    { id: '2', title: 'God of War', platform: ['PlayStation 4'] },
    { id: '3', title: 'Red Dead Redemption 2', platform: ['PlayStation 4', 'Xbox One', 'PC'] },
];

let reviews = [
    { id: '1', rating: 10, content: 'An absolute masterpiece with stunning visuals and an immersive open world.', author_id: '1' , game_id: '1'},
    { id: '2', rating: 9, content: 'A gripping story and intense combat make this a must-play for action fans.',  author_id: '3' , game_id: '3' },
    { id: '3', rating: 8, content: 'A beautifully crafted game with a rich narrative and memorable characters.',  author_id: '2' , game_id: '2' },
];

let authors = [
    { id: '1', name: 'John Doe', verified: true },
    { id: '2', name: 'Jane Smith', verified: false },
    { id: '3', name: 'Alice Johnson', verified: true },
];

export const db = {
    games,
    reviews,
    authors,
};
