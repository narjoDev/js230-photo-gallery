document.addEventListener("DOMContentLoaded", () => {
  const slideshow = document.getElementById("slideshow");
  const slides = document.getElementById("slides");
  const comments = document.getElementById("comments");

  const templateFromId = (id) =>
    Handlebars.compile(document.getElementById(id).innerHTML);

  const templates = {
    photos: templateFromId("photos"),
    information: templateFromId("photo_information"),
    comments: templateFromId("photo_comments"),
  };

  Handlebars.registerPartial(
    "photo_comment",
    document.getElementById("photo_comment").innerHTML
  );
});
