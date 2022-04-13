# Reagent

A collection of UI components

## Getting Started

* Get an image gallery component along with event handlers for the consumer to execute when, or if, those events shall occur within their application

    ````javascript
    import { getImageGalleryWithChangeHandlers } from '@mtbjorn/reagent`;
    import { renderElementAsAppend } from '@mtbjorn/hypotenuse`;

    const initialData = []; // array of objects -> { fileId, fileName, url }
    const [galleryComponent, onComponentRender, onDataChange] = getImageGalleryWithChangeHandlers(initialData);

    const domElement = renderElementAsAppend(galleryComponent, document.getElementById('app-container'));
    onComponentRender(domElement);

    const newImages = [];
    onDataChange(newImages);
    ````

    * `initialData` is an optional argument, an array of objects (`{fileId, fileName, url}`) for each image to display within the gallery
        * `fileId` is a **string** identifier, *currently only used as the `id` attribute of each generated `<ImageFrame />` component*
        * `fileName` is a **string**, *currently used as the `alt` & `title` attributes of each generated `<ImageFrame />` component*
        * `url` is any data url valid for an `<img>` element's `src` attribute
    * `galleryComponent` is a pre-built component, a pure function which can be rendered as the consumer wishes
    * It is expected the consumer will call `onComponentRender` after the associated `<ImageGallery>` component is rendered
        * A reference to the rendered dom element should be provided as the sole argument
        * This `async` function initializes the `<ImageGallery>`, mainly preparing the associated `<ImageGalleryModal>`
    * The consumer may refresh the `<ImageGallery>` with a new array of image data by providing said data to the `onDataChange` function

* Get an image uploading component

    ````javascript
    import { ImageUploader } from '@mtbjorn/reagent`;
    import { renderElementAsAppend } from '@mtbjorn/hypotenuse`;

    renderElementAsAppend(<ImageUploader
        title={'Input Title'},
        disabled={trueOrFalse},
        handleFileUpload={(fileObjectArray) => {}},
        onUploadFailure = {(errorMessageArray) => {}},
        maxFileSizeMb={10}
        maxFileSizeToleranceKb={50}
        />,
        document.getElementById('app-container')
    );
    ````

    * `title` is the `title` for the underlying `input` element
    * If `disabled`, the uderlying `input` element will be disabled
    * `handleFileUpload` should be a function which will operate on each `File` object uploaded through the underlying `input` element
    * `onUploadFailure` is a function to handle any errors thrown while uploading files
        * The function should accomodate an array of error messages, one for each file that failed during a batch upload
        * The default error handler, if none is provided, will print to `console`
    * `maxFileSizeMb` is the max size (in MB) to allow being uploaded
        * image files, except for `gif`, will be resized to less than the specified max, within a specified tolerance
        * If unspecified a default of `10MB` is used
    * `maxFileSizeToleranceKb` is the tolerance (in Kb) to permit a resized image to fall within (below the max)
        * If unspecified a default of `50Kb` is used
    * `ico` files are ignored by the uploader
