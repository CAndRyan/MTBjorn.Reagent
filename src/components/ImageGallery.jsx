import ImageFrame from './ImageFrame';
import getConnectedImageGalleryModal from './ImageGalleryModal';
import { renderElement, replaceElement } from '@mtbjorn/hypotenuse/ui';
import styles from './styles/ImageGallery';

const ImageGallery = ({ title, images, onImageClick }) => (
	<div className={styles.imageGallery}>
		<h2>Selected Folder: {title}</h2>
		{images.map(({ fileId, fileName, url }) => <ImageFrame fileId={fileId} fileName={fileName} url={url} onClickHandler={onImageClick} />) }
	</div>
);

// TODO: add description of async component structure to README -- the idea is to defer rendering of any component defined as an async function.
// I believe the custom rendering code could be updated to detect such components & itself use async/await to trigger the provided render functions at the appropriate times.
// It may not be necessary to update the JSX preprocessor as well...
// The entire component may need to be async if we can't get something to handle coordination between the component renderer & preprocesser
const getValidImageDataDeferred = (initialImageData) => async () => {
	const validImageDataLoaders = initialImageData.map(({ fileId, fileName, url }) => async () => {
		var actualFileName = fileName ? fileName : fileId;

		// Attempt to load an image first in order to handle errors before attaching to the DOM
		const promiseImageLoad = new Promise((resolve) => {
			var image = new Image();
			image.onload = () => {
				resolve(url);
			};
			image.onerror = () => {
				// TODO: remove fileId reference from local storage if unable to find image? Or provide feature for user's to clean them up manually?
				resolve(null);
			};

			image.src = url;
		});

		const imageUrl = await promiseImageLoad;
		if (!imageUrl)
			return null;

		return {
			fileId,
			actualFileName,
			url: imageUrl
		};
	});
	const validImageData = (await Promise.all(validImageDataLoaders.map(promiseLoad => promiseLoad()))).filter((imageData) => imageData !== null);

	return validImageData.reverse(); // Note: return images ordered with last uploaded being first
};

const getFolderDataWithLoaders = (initialFolderData) => initialFolderData.reduce((aggregate, { folder, images }) => ({
	...aggregate,
	[folder]: {
		getImages: getValidImageDataDeferred(images),
		images: []
	}
}), {});

const getImageGalleryWithChangeHandlers = async (initialFolderData = [], initialSelectedFolder) => {
	let folderImageLoadersMap = getFolderDataWithLoaders(initialFolderData);
	let selectedFolder = initialSelectedFolder || initialFolderData.length === 0 ? initialSelectedFolder : Object.keys(folderImageLoadersMap)[0]

	const initialSelectedFolderData = folderImageLoadersMap[selectedFolder];
	if (initialSelectedFolderData) {
		initialSelectedFolderData.images = await initialSelectedFolderData.getImages();
	}

	const initialImageData = initialSelectedFolderData ? initialSelectedFolderData.images : [];
	let [ImageGalleryModal, openModal] = getConnectedImageGalleryModal(initialImageData);
	let openGalleryModal = ({ target }) => {
		openModal(target.id);
	};
	const galleryComponent = <ImageGallery images={initialImageData} onImageClick={openGalleryModal} />;

	let galleryElement;
	let modalElement;

	const onComponentRender = async (domElement) => {
		galleryElement = domElement;
		modalElement = await renderElement(<ImageGalleryModal images={initialImageData} />, (el) => {
			const bodyElement = document.getElementsByTagName('body')[0];
			bodyElement.append(el);
		});
	};

	// Only refresh image data if not a folder changes (presumed data change)
	const onDataChange = async (latestFolderData, latestSelectedFolder) => {
		if (latestSelectedFolder === selectedFolder) {
			folderImageLoadersMap = getFolderDataWithLoaders(latestFolderData);
		}
		selectedFolder = latestSelectedFolder || latestFolderData.length === 0 ? latestSelectedFolder : Object.keys(folderImageLoadersMap)[0]
		
		const latestSelectedFolderData = folderImageLoadersMap[selectedFolder];
		if (latestSelectedFolderData && latestSelectedFolderData.images.length === 0) {
			latestSelectedFolderData.images = await latestSelectedFolderData.getImages();
		}
		const latestImageData = latestSelectedFolderData ? latestSelectedFolderData.images : [];

		[ImageGalleryModal, openModal] = getConnectedImageGalleryModal(latestImageData);
		openGalleryModal = ({ target }) => {
			openModal(target.id);
		};

		galleryElement = await replaceElement(galleryElement, <ImageGallery title={selectedFolder} images={latestImageData} onImageClick={openGalleryModal} />);
		modalElement = await replaceElement(modalElement, <ImageGalleryModal images={latestImageData} />);
	};

	return [galleryComponent, onComponentRender, onDataChange];
};

export default getImageGalleryWithChangeHandlers;
