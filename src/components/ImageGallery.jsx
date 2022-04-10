import UploadedImage from './UploadedImage';
import getConnectedImageGalleryModal from './ImageGalleryModal';
import { renderElement, replaceElement } from '@mtbjorn/hypotenuse/ui'; // require('@mtbjorn/hypotenuse/dist/ui')
import styles from './styles/ImageGallery';

const ImageGallery = ({ images, onImageClick }) => (
	<div className={styles.imageGallery}>
		{images.map(({ fileId, fileName, url }) => <UploadedImage fileId={fileId} fileName={fileName} url={url} onClickHandler={onImageClick} />) }
	</div>
);

// TODO: add description of async component structure to README -- the idea is to defer rendering of any component defined as an async function.
// I believe the custom rendering code could be updated to detect such components & itself use async/await to trigger the provided render functions at the appropriate times.
// It may not be necessary to update the JSX preprocessor as well...
// The entire component may need to be async if we can't get something to handle coordination between the component renderer & preprocesser
const getValidImageData = async (initialData) => {
	const validImageDataLoaders = initialData.map(({ fileId, fileName, url }) => async () => {
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
			fileName,
			url: imageUrl
		};
	});
	const validImageData = (await Promise.all(validImageDataLoaders.map(promiseLoad => promiseLoad()))).filter((imageData) => imageData !== null);

	return validImageData.reverse(); // Note: return images ordered with last uploaded being first
};

const getImageGalleryWithChangeHandlers = async (initialData) => {
	const initialImageData = await getValidImageData(initialData);
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

	const onDataChange = async (latestData) => {
		const latestValidData = await getValidImageData(latestData);
		[ImageGalleryModal, openModal] = getConnectedImageGalleryModal(latestValidData);
		openGalleryModal = ({ target }) => {
			openModal(target.id);
		};

		galleryElement = await replaceElement(galleryElement, <ImageGallery images={latestValidData} onImageClick={openGalleryModal} />);
		modalElement = await replaceElement(modalElement, <ImageGalleryModal images={latestValidData} />);
	};

	return [galleryComponent, onComponentRender, onDataChange];
};

export default getImageGalleryWithChangeHandlers;
