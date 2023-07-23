const addToCart = async (elm) => {
    const book_class = elm.parentElement.classList;
    let book_name = document.querySelector(`.${book_class[1]} .book_name`).innerHTML;
    const data = {
        book_name,
    };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };
    const responce = await fetch("/add_to_cart", options);
    const responceData = await responce.json();
    responceData.status?confirm("added"):alert("not available");
}

const deleteBook = async (elm) => {
    const book_class = elm.parentElement.classList;
    let book_name = document.querySelector(`.${book_class[1]} .book_name`).innerHTML;
    let author_name = document.querySelector(`.${book_class[1]} .author_name`).innerHTML;
    const data = {
        book_name,
        author_name
    };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };
    await fetch('/delete_book', options);
    location.replace("/books");
}
