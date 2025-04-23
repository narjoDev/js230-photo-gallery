document.addEventListener("DOMContentLoaded", () => {
  const slideshow = document.getElementById("slideshow");
  const slides = document.getElementById("slides");
  const info = document.querySelector("section > header");
  const commentList = document.querySelector("#comments > ul");

  const templates = {
    photos: templateFromId("photos"),
    information: templateFromId("photo_information"),
    comments: templateFromId("photo_comments"),
  };

  Handlebars.registerPartial(
    "photo_comment",
    document.getElementById("photo_comment").innerHTML
  );

  let photos;

  getPhotos()
    .then(renderPhotos)
    .then(() => renderInfo(0))
    .then(() => getComments(photos[0].id))
    .then(renderComments);

  async function getPhotos() {
    return await get("/photos").then((photosJson) => {
      photos = photosJson;
    });
  }

  async function getComments(photo_id) {
    return await get(`/comments?photo_id=${photo_id}`);
  }

  function renderPhotos() {
    slides.innerHTML = templates.photos({ photos });
  }

  function renderInfo(index) {
    info.innerHTML = templates.information(photos[index]);
  }

  function renderComments(comments) {
    commentList.innerHTML = templates.comments({ comments });
  }

  function get(url) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("GET", url);
      request.responseType = "json";

      request.addEventListener("load", (event) => {
        resolve(request.response);
      });
      request.addEventListener("error", reject);

      request.send();
    });
  }

  function templateFromId(id) {
    return Handlebars.compile(document.getElementById(id).innerHTML);
  }
});
