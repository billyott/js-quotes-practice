const quoteListUl = document.querySelector('#quote-list')
const newQuoteForm = document.querySelector('#new-quote-form')
const h1 = document.querySelector('h1')
h1.insertAdjacentHTML('afterend', "<button class='btn btn-secondary'>Sort: Off</button>")
const sortButton = document.querySelector('.btn-secondary')

function initialize() {
    renderAllQuotes()
}

function renderQuote(quoteObj,likeCount=0) {
    
    const li = document.createElement('li')
    li.className = 'quote-card'

    quoteListUl.append(li)
    
    const blockquote = document.createElement('blockquote')
    blockquote.className = "blockquote"
    blockquote.dataset.id = quoteObj.id
    
    li.append(blockquote)

    const p = document.createElement('p')
    p.className = "mb-0"
    p.dataset.id = `p-${quoteObj.id}`
    p.textContent = quoteObj.quote
    
    const footer = document.createElement('footer')
    footer.className = "blockquote-footer"
    footer.dataset.id = `footer-${quoteObj.id}`
    footer.textContent = quoteObj.author

    const lineBreak = document.createElement('br')

    const successButton = document.createElement('button')
    successButton.className = 'btn btn-success'
    successButton.innerHTML = `
        Likes: <span>${likeCount}</span>
    `
    successButton.addEventListener('click', handleQuoteLike)

    const dangerButton = document.createElement('button')
    dangerButton.className = 'btn btn-danger'
    dangerButton.textContent = 'Delete'
    dangerButton.addEventListener('click', handleQuoteDelete)

    const editButton = document.createElement('button')
    editButton.className = 'btn btn-warning'
    editButton.dataset.target = `#edit-form-${quoteObj.id}`
    editButton.textContent = 'Edit'
    editButton.addEventListener('click', handleQuoteEdit)

    const editForm = document.createElement('form')
    editForm.style.display = 'none'
    editForm.id = `edit-form-${quoteObj.id}`
    editForm.dataset.id = quoteObj.id
    editForm.innerHTML = `
        <label for="edit-quote">Quote</label>
        <input id="edit-quote" name="quote" value="${quoteObj.quote}">
        <label for="edit-author">Author</label>
        <input id="edit-author" name="author" value="${quoteObj.author}">
        <button type="submit">Submit</button>
    `
    editForm.addEventListener('submit', handleEditQuoteSubmit)

    blockquote.append(p, footer, lineBreak, editForm, successButton, dangerButton, editButton)
}

function renderAllQuotes() {
    fetch('http://localhost:3000/quotes?_embed=likes')
    .then(response => response.json())
    .then(quotes => {
        quotes.forEach(function(quote){
            renderQuote(quote,quote.likes.length)
        })
    })
}

function handleNewQuoteSubmit(e) {
    e.preventDefault()
    
    const newQuote = {
        quote: e.target.quote.value,
        author: e.target.author.value
    }

    const configObj = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newQuote)
    }

    fetch('http://localhost:3000/quotes', configObj)
    .then(response => response.json())
    .then(quote => renderQuote(quote))
    
}

function handleQuoteDelete(e) {
    fetch(`http://localhost:3000/quotes/${e.target.parentNode.dataset.id}`, {method: 'DELETE'})
    .then(response => response.json())
    .then(quote => console.log("Deleted",quote))
    e.target.parentNode.parentNode.remove()
}

function handleQuoteLike(e) {
    const likeObj = {quoteId: parseInt(e.target.parentNode.dataset.id)}
    // e.target.firstElementChild.innerHTML = parseInt(e.target.firstElementChild.innerHTML)+1
    const configObj = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(likeObj)
    }
    fetch('http://localhost:3000/likes', configObj)
    .then(response => response.json())
    .then(like => {
        console.log("Success", like)
        fetch(`http://localhost:3000/quotes/${e.target.parentNode.dataset.id}?_embed=likes`)
        .then(response => response.json())
        .then(quote => {
            console.log(quote)
            e.target.firstElementChild.innerHTML = quote.likes.length
        })
    })
}

function handleQuoteEdit(e) {
    const editForm = document.querySelector(e.target.dataset.target)
    if (editForm.style.display === 'block') {
        editForm.style.display = 'none'
    } else {
        editForm.style.display = 'block'
    }
}

function handleEditQuoteSubmit(e) {
    e.preventDefault()
    const updatedQuote = {    
        quote: e.target.quote.value,
        author: e.target.author.value
    }
    const configObj = {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedQuote)
    }
    fetch(`http://localhost:3000/quotes/${e.target.dataset.id}`, configObj)
    .then(response => response.json())
    .then(quoteObj => {
        console.log("Success", quoteObj)
        e.target.style.display = 'none'
        const p = document.querySelector(`[data-id="p-${quoteObj.id}"`)
        p.textContent = quoteObj.quote
        const footer = document.querySelector(`[data-id="footer-${quoteObj.id}"`)
        footer.textContent = quoteObj.author
    })
}

function handleSortQuotes() {
    const sortToggle = {
        "Sort: Off": "Sort: On",
        "Sort: On": "Sort: Off"
    }
    sortButton.innerHTML = sortToggle[sortButton.innerHTML]
    if (sortButton.innerHTML === "Sort: On") {
        quoteListUl.innerHTML = ''
        fetch('http://localhost:3000/quotes?_sort=author&_embed=likes')
        .then(response => response.json())
        .then(quotes => {
            quotes.forEach(function(quote){
                renderQuote(quote,quote.likes.length)
            })
        })
    } else {
        quoteListUl.innerHTML = ''
        renderAllQuotes()
    }
}

newQuoteForm.addEventListener('submit', handleNewQuoteSubmit)

sortButton.addEventListener('click', handleSortQuotes)

//*********** init ***********
initialize()