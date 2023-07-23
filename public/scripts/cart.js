const give_back = async (elm) => {
    const book_class = elm.parentElement.parentElement.classList[0];
    const book_name = document.querySelector(`.${book_class} .name > p`).innerHTML;
    const data = { book_name };
    const options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };
    const responce = await fetch("/give_back", options);
    const responceData = await responce.json();
    responceData.status? confirm("done") : alert("can't delete");
    location.replace("/cart");
};