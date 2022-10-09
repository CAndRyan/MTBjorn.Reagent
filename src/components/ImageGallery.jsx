import { v4 as uuidv4 } from 'uuid';
import ImageFrame from './ImageFrame';
import getConnectedImageGalleryModal from './ImageGalleryModal';
import { renderElement, replaceElement } from '@mtbjorn/hypotenuse/ui';
import styles from './styles/ImageGallery';

const ImageGalleryPanel = ({ id, images, onImageClick }) => {
	<div id={id}>
		{images.map(({ fileId, fileName, url }) => <ImageFrame fileId={fileId} fileName={fileName} url={url} onClickHandler={onImageClick} />) }
	</div>
};

const ImageGallery = ({ initialSelectedFolder = null, images, folders = [], onImageClick, onFolderChange = () => Promise.resolve([]) }) => {
	const galleryPanelId = uuidv4();
	const folderSelectId = uuidv4();
	const titleElementId = uuidv4();
	const refreshGalleryPanel = async (updatedImages) => {
		const galleryPanelElement = document.getElementById(galleryPanelId);
		await replaceElement(galleryPanelElement, <ImageGalleryPanel id={galleryPanelId} images={updatedImages} onImageClick={onImageClick} />)
	};
	const onFolderSelect = async ({ target }) => {
		const folderName = target.value;
		const updatedImages = await onFolderChange(folderName);
		await refreshGalleryPanel(updatedImages);

		const titleElement = document.getElementById(titleElementId);
		const folderSelectElement = document.getElementById(folderSelectId);
		titleElement.innerText = folderName ? `Selected Folder: ${folderName}` : 'Images';
		folderSelectElement.className = folderName ? '' : styles.hidden;
	}
	
	return (
		<div className={styles.imageGallery}>
			<h2 id={titleElementId}>{initialSelectedFolder ? `Selected Folder: ${initialSelectedFolder}` : 'Images'}</h2>
			<div id={folderSelectId} className={initialSelectedFolder ? '' : styles.hidden}>
				<select onChange={onFolderSelect} selectedIndex={folders.findIndex((folder) => folder === initialSelectedFolder)}>
					{folders.map((folderName) => <option value={folderName}>{folderName}</option>)}
				</select>
			</div>
			<ImageGalleryPanel id={galleryPanelId} images={images} onImageClick={onImageClick} />
		</div>
	);
};

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

const getImageGalleryWithChangeHandlers = async (initialFolderData = [], initialSelectedFolder = null, onFolderStateChange = () => Promise.resolve()) => {
	let folderImageLoadersMap = getFolderDataWithLoaders(initialFolderData);
	let selectedFolder = initialSelectedFolder;
	let selectedFolderImageData = [];

	const loadImagesForSelectedFolder = async () => {
		const selectedFolderData = selectedFolder ? folderImageLoadersMap[selectedFolder] : Object.values(folderImageLoadersMap)[0];
		if (selectedFolderData && selectedFolderData.images.length === 0) {
			selectedFolderData.images = await selectedFolderData.getImages();
		}
		selectedFolderImageData = selectedFolderData ? selectedFolderData.images : [];
	};

	await loadImagesForSelectedFolder();

	let [ImageGalleryModal, openModal] = getConnectedImageGalleryModal(selectedFolderImageData);
	let openGalleryModal = ({ target }) => {
		openModal(target.id);
	};
	const galleryComponent = <ImageGallery images={selectedFolderImageData} onImageClick={openGalleryModal} />;

	let galleryElement;
	let modalElement;

	// Returns a new set of images, letting the gallery element refresh itself
	const onFolderChange = async (latestSelectedFolder) => {
		if (latestSelectedFolder === selectedFolder) return;

		selectedFolder = latestSelectedFolder;
		const updatedImages = await loadImagesForSelectedFolder();
		await onFolderStateChange(selectedFolder);

		return updatedImages;
	};

	const onComponentRender = async (domElement) => {
		galleryElement = domElement;
		modalElement = await renderElement(<ImageGalleryModal images={selectedFolderImageData} />, (el) => {
			const bodyElement = document.getElementsByTagName('body')[0];
			bodyElement.append(el);
		});
	};

	const onDataChange = async (latestFolderData) => {
		// TODO: implement comparison logic to diff folder data changes, only reloading those folders that changed
		folderImageLoadersMap = getFolderDataWithLoaders(latestFolderData);
		
		await loadImagesForSelectedFolder();

		[ImageGalleryModal, openModal] = getConnectedImageGalleryModal(latestImageData);
		openGalleryModal = ({ target }) => {
			openModal(target.id);
		};

		galleryElement = await replaceElement(galleryElement, <ImageGallery
			initialSelectedFolder={selectedFolder}
			images={latestImageData}
			onFolderChange={onFolderChange}
			onImageClick={openGalleryModal}
		/>);
		modalElement = await replaceElement(modalElement, <ImageGalleryModal images={latestImageData} />);
	};

	return [galleryComponent, onComponentRender, onDataChange];
};

export default getImageGalleryWithChangeHandlers;
