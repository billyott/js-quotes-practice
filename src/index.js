const quoteListUl = document.querySelector('#quote-list')
const newQuoteForm = document.querySelector('#new-quote-form')

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
    p.textContent = quoteObj.quote
    
    const footer = document.createElement('footer')
    footer.className = "blockquote-footer"
    footer.textContent = quoteObj.author

    const lineBreak = document.createElement('br')

    const successButton = document.createElement('button')
    successButton.className = 'btn-success'
    successButton.innerHTML = `
        Likes: <span>${likeCount}</span>
    `
    successButton.addEventListener('click', handleQuoteLike)

    const dangerButton = document.createElement('button')
    dangerButton.className = 'btn-danger'
    dangerButton.textContent = 'Delete'
    dangerButton.addEventListener('click', handleQuoteDelete)

    blockquote.append(p, footer, lineBreak, successButton, dangerButton)
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
    const likeObj = {quote_id: parseInt(e.target.parentNode.dataset.id)}
    e.target.firstElementChild.innerHTML = parseInt(e.target.firstElementChild.innerHTML)+1
    const configObj = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(likeObj)
    }
    fetch('http://localhost:3000/likes', configObj)
    .then(response => response.json())
    .then(like => console.log("Success",like))
}

newQuoteForm.addEventListener('submit', handleNewQuoteSubmit)


//*********** init ***********
initialize()