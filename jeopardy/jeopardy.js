
let categories = [];

// returns an array of 6 category ids 
async function getCategoryIds() {
    // Generate random number to query the endpoint to get different categories
    let randomNum = Math.floor(Math.random() * 10000);
    let res = await axios.get(`http://jservice.io/api/categories?count=6&offset=${randomNum}`)
    // loop through data and push ids onto the global categories variable
    return res.data.map(arr => arr.id)
}

//Accepts a category ID and returns a category Object {title:title, clues: [...]}
async function getCategory(catId) {
    let res = await axios.get(`http://jservice.io/api/category?id=${catId}`)
    let categoryObj = { title: res.data.title, clues: [] }
    for (let clue of res.data.clues) {
        // push category questions,answers and showing tracker into category object
        categoryObj.clues.push({ question: clue.question, answer: clue.answer, showing: null })
    }
    return categoryObj
}

//accepts an array of category IDs, gets the formatted objects and pushes them to the global categories array
async function pushCategories(catIdArr) {
    for (let id of catIdArr) {
        categories.push(await getCategory(id))
    }
    return categories;
}

async function fillTable() {
    const $htmlBoard = $('#game')
    const $tHead = $('<thead>')
    const $tBody = $('<tbody>')
    const $headRow = $('<tr>')

    $tHead.attr('id', 'category-titles')
    $htmlBoard.addClass('table table-bordered')
    $tHead.addClass('thead-dark')

    $htmlBoard.append($tHead)
    $htmlBoard.append($tBody)
    $tHead.append($headRow)

    //Loop through categories array and add th containing category titles
    for (let i = 0; i < categories.length; i++) {
        const catTitle = categories[i].title
        $headRow.append($('<th class="align-middle">').text(catTitle))
    }

    for (let i = 0; i < 5; i++) {
        const $tBodyRow = $('<tr>');
        $tBody.append($tBodyRow);
        for (let j = 0; j < 6; j++) {
            const $catClue = $('<td>')
            $catClue.attr('id', `${j}-${i}`)
            $catClue.html(`<i id="${j}-${i}" class="fal fa-question-circle"></i>`)
            $tBodyRow.append($catClue)
        }
    }
}



function handleClick() {
    $('td').on('click', (e) => {
        const clueElement = $(`#${e.target.id}`)
        const clueIndex = e.target.id.split('-')[1]
        const categoryIndex = e.target.id.split('-')[0]
        const clue = categories[categoryIndex].clues[clueIndex]
        const clueQuestion = clue.question;
        const clueAnswer = clue.answer;
        const clueShowing = clue.showing


        if (clueShowing === null) {
            updateClueShowing(clue)
            clueElement.text(clueQuestion)
        } else if (clueShowing === 'question') {
            updateClueShowing(clue)
            clueElement.text(clueAnswer)
        }

    })
}

function updateClueShowing(clue) {
    if (clue.showing === null) {
        clue.showing = 'question'
    } else if (clue.showing === 'question') {
        clue.showing === 'answer'
    }

}

//Adds a loading spinner while we wait for the async functions to complete
function showLoadingView() {
    const $gameContainer = $('#game-container');
    const $spinnerContainer = $('<div id="spinner">')
    $spinnerContainer.html('<i class="fas fa-spinner fa-spin fa-8x"></i>')
    $gameContainer.append($spinnerContainer)
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $('#spinner').remove()
    $('#start-btn').text('Restart!');
}


async function setupAndStart() {
    $('#game').empty()
    categories = [];
    showLoadingView();
    await pushCategories(await getCategoryIds())
    hideLoadingView()
    fillTable()
    handleClick()
}

$('#start-btn').on('click', setupAndStart)



