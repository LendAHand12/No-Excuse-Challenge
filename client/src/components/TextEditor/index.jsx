import { useRef } from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import fontSize from "suneditor/src/plugins/submenu/fontSize";
import font from "suneditor/src/plugins/submenu/font";
import formatBlock from "suneditor/src/plugins/submenu/formatBlock";
import image from "suneditor/src/plugins/dialog/image";
import table from "suneditor/src/plugins/submenu/table";
import template from "suneditor/src/plugins/submenu/template";

const TextEditor = (props) => {
  const editor = useRef();

  const getSunEditorInstance = (sunEditor) => {
    editor.current = sunEditor;
  };

  editor.onImageUploadBefore = function (files, info, core, uploadHandler) {
    try {
      resizeImage(files, uploadHandler);
    } catch (err) {
      uploadHandler(err.toString());
    }
  };

  function resizeImage(files, uploadHandler) {
    const uploadFile = files[0];
    const img = document.createElement("img");
    const canvas = document.createElement("canvas");
    const reader = new FileReader();

    reader.onload = function (e) {
      img.src = e.target.result;
      img.onload = function () {
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          async function (blob) {
            let res = await addPhoto(
              [new File([blob], uploadFile.name)]
              // loggedUser.institute._id,
              // loggedUser._id
            );
            if (res.success) {
              // Need to implement the image URL logic here
              uploadHandler();
            } else {
              uploadHandler(res.message);
            }
          },
          uploadFile.type,
          1
        );
      };
    };

    reader.readAsDataURL(uploadFile);
  }

  function addPhoto(files) {
    if (!files.length) {
      return alert("Please choose a file to upload first.");
    }
    var file = files[0];
    var photoKey =
      "uploads/" + file.name.split(".")[0] + file.name.split(".")[1];
    // var upload = new AWS.S3.ManagedUpload({
    //   params: {
    //     // Bucket: bucketName,
    //     Key: photoKey,
    //     Body: file,
    //     ACL: "public-read",
    //   },
    // });

    // var promise = upload.promise();

    // promise.then(
    //   function (data) {
    //     return {
    //       success: true,
    //       finalImageURL:
    //         "https://" +
    //         bucketName +
    //         ".s3.ap-south-1.amazonaws.com/" +
    //         photoKey,
    //     };
    //   },
    //   function (err) {
    //     return {
    //       success: false,
    //       message: "There was an error uploading your photo",
    //     };
    //   }
    // );
  }

  return (
    <SunEditor
      {...props}
      setAllPlugins={false}
      placeholder="Please enter content..."
      getSunEditorInstance={getSunEditorInstance}
      height="100%"
      setOptions={{
        plugins: [fontSize, font, formatBlock, image, table, template],
        font: [
          "Arial",
          "Comic Sans MS",
          "Courier New",
          "Impact",
          "Georgia",
          "Tahoma",
          "Trebuchet MS",
          "Verdana",
          "Logical",
          "Salesforce Sans",
          "Garamond",
          "Sans-Serif",
          "Serif",
          "Times New Roman",
          "Helvetica",
        ],
        fontSize: [
          8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 42, 55, 60,
        ],
        buttonList: [
          ["undo", "redo", "font", "fontSize", "formatBlock"],
          [
            "bold",
            "underline",
            "italic",
            "strike",
            "subscript",
            "superscript",
            "removeFormat",
          ],
          [
            ("fontColor",
            "hiliteColor",
            "outdent",
            "indent",
            "align",
            "horizontalRule",
            "list",
            "table"),
          ],
          [
            "template",
            "link",
            "image",
            "video",
            "fullScreen",
            "showBlocks",
            "codeView",
            "preview",
            "print",
            "save",
          ],
        ],
      }}
    />
  );
};
export default TextEditor;
