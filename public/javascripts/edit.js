const editor = new EditorJS({

    tools: {
        header: {
            class: Header,
            inlineToolbar: ['link'],
            config: {
                placeholder: "Title",
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 1,
            },
        },
        list: {
            class: List,
            inlineToolbar: ["link", "bold"],
            config: {
                defaultStyle: "unordered",
            },
        },
        embed: {
            class: Embed,
            inlineToolbar: false,
            config: {
                services: {
                    youtube: true,
                },
            },
        },
        code: CodeTool,
        image: {
            class: ImageTool,
            config: {
                endpoints: {
                    byFile: "http://localhost:3000/uploadFile", // Your backend file uploader endpoint
                    byUrl: "http://localhost:3000/fetchUrl", // Your endpoint that provides uploading by Url
                },
                field: "avatar",
                type: "image/*",
            },
        },
        quote: {
            class: Quote,
            config: {
                quotePlaceholder: "Enter a quote",
                captionPlaceholder: "Quote's author",
            },
        },

    }

});


// ------------------

const saveBtn = document.querySelector('#editorjs-btn');

saveBtn.addEventListener('click', function () {
    editor.save()
        .then(async ({ blocks }) => {
            // console.log(blocks);
            let blog = "";

            blocks.forEach((elem) => {
                // console.log(elem);
                if (elem.type === "paragraph") {
                    blog += "<p>" + elem.data.text + "</p>"
                }
                if (elem.type === "header") {
                    blog +=
                        "<h" +
                        elem.data.level +
                        ">" +
                        elem.data.text +
                        "</h" +
                        elem.data.level +
                        ">";
                }
                if (elem.type === "list") {
                    blog +=
                        "<" +
                        elem.data.style[0] +
                        elem.type[0] +
                        "/>" +
                        elem.data.items
                            .map((i) => "<li>" + i + "</li>")
                            .join("") +
                        "<" +
                        elem.data.style[0] +
                        elem.type[0] +
                        "/>";
                }
                if (elem.type === "code") {
                    blog +=
                        "<" +
                        elem.type +
                        ">" +
                        elem.data.code +
                        "</" +
                        elem.type +
                        ">";
                }
                if (elem.type === "quote") {
                    blog +=
                        "<" +
                        elem.type[0] +
                        ">" +
                        elem.data.text +
                        "</" +
                        elem.type[0] +
                        ">";
                }
                if (elem.type === "image") {
                    blog +=
                        "<img src=" +
                        elem.data.file.url +
                        " /><figcaption>" +
                        elem.data.caption +
                        "</figcaption>";
                }
            });
            const { data } = await axios.post("http://localhost:3000/write", {
                blog,
            });
            window.location.href = "http://localhost:3000/stories";
        })
        .catch((err) => {
            console.log(err)
        })
})

