import $ from 'jquery';

const apiUrl = '/api/v1';


//Books that are pending approval
const pendingBooks = () => {
    $.get(`${apiUrl}/books?status=1`).then((res) => {
      if (res.status !== "error") {
        this.setState({
          books: res.data,
        })
      } else {
        window.location.href = "/";
      }
    });
}

export { pendingBooks };
