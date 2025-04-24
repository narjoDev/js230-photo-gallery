document.addEventListener("DOMContentLoaded", () => {
  const slideshow = document.getElementById("slideshow");
  const slides = document.getElementById("slides");
  const info = document.querySelector("section > header");
  const commentList = document.querySelector("#comments > ul");
  const form = document.querySelector("form");

  const templates = {
    photos: templateFromId("photos"),
    information: templateFromId("photo_information"),
    comments: templateFromId("photo_comments"),
    comment: templateFromId("photo_comment"),
  };

  Handlebars.registerPartial(
    "photo_comment",
    document.getElementById("photo_comment").innerHTML
  );

  let photos;
  let activeIndex = 0;

  getPhotos()
    .then(renderPhotos)
    .then(() => renderInfo(0))
    .then(() => getComments(photos[0].id))
    .then(renderComments);

  document.querySelector(".prev").addEventListener("click", previous);
  document.querySelector(".next").addEventListener("click", next);

  info.addEventListener("click", handleAction);
  form.addEventListener("submit", handleForm);

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

  function previous(event) {
    event.preventDefault();
    changeSlide(-1);
  }

  function next(event) {
    event.preventDefault();
    changeSlide(1);
  }

  function changeSlide(offset) {
    const oldActive = slides.children[activeIndex];
    activeIndex = (photos.length + activeIndex + offset) % photos.length;
    const newActive = slides.children[activeIndex];
    const newId = newActive.dataset.id;

    oldActive.classList.remove("active");
    oldActive.classList.add("inactive");
    newActive.classList.remove("inactive");
    newActive.classList.add("active");
    renderInfo(activeIndex);
    getComments(newId).then(renderComments);
  }

  function handleAction(event) {
    if (event.target.tagName !== "A") return;
    event.preventDefault();

    const {
      href,
      dataset: { id, property },
    } = event.target;

    //in case active changes before fetch completes
    let cacheActiveIndex = activeIndex;
    fetch(href, {
      method: "post",
      headers: {
        //"Content-Type": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      // body: JSON.stringify({ photo_id: id }),
      body: `photo_id=${id}`,
    })
      .then((response) => response.json())
      .then(({ total }) => {
        //update property on what was active
        photos[cacheActiveIndex][property] = total;
        //refresh info but maintain focus change if happened
        renderInfo(activeIndex);
      });
  }

  function handleForm(event) {
    event.preventDefault();

    let formData = new FormData(form);
    formData.set("photo_id", photos[activeIndex].id);
    let params = new URLSearchParams(formData);
    let { action, method } = form;

    console.log(formData);
    fetch(action, {
      method,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      // body: formData,
      body: params,
    })
      .then((response) => response.json())
      .then((comment) => {
        commentList.insertAdjacentHTML("beforeend", templates.comment(comment));
      });
    form.reset();
  }
});
