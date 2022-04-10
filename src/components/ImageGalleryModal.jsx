import styles from './styles/ImageGalleryModal';

const getConnectedImageGalleryModal = (images) => {
	let activeImageIndex = -1;
	let domCache = null;

	const modalElementId = 'gallery-image-modal';
	const activeImageElementId = 'gallery-image-active';
	const imageCaptionElementId = 'gallery-image-caption';
	const imageNumberElementId = 'gallery-image-number';

	const getDomElements = () => {
		if (!domCache)
			domCache = {
				modalElement: document.getElementById(modalElementId),
				activeImageElement: document.getElementById(activeImageElementId),
				captionElement: document.getElementById(imageCaptionElementId),
				imageNumberElement: document.getElementById(imageNumberElementId)
			}

		return domCache;
	};

	const setDataForActiveSlide = () => {
		const { activeImageElement, captionElement, imageNumberElement } = getDomElements();
		const { fileName, url } = images[activeImageIndex] ?? {};

		activeImageElement.src = url ?? '';
		activeImageElement.alt = fileName ?? '';
		captionElement.innerText = fileName ?? '';
		imageNumberElement.innerText = `${activeImageIndex + 1} / ${images.length}`;
	};

	const openModal = (activeImageId) => {
		activeImageIndex = images.findIndex((image) => image.fileId === activeImageId);
		if (activeImageIndex === -1)
			throw `Unable to find image in gallery (ID='${activeImageId}')`;

		setDataForActiveSlide();

		const { modalElement } = getDomElements();
		modalElement.style.display = 'block';

		const bodyElement = document.getElementsByTagName('body')[0];
		bodyElement.classList.add(styles.hasOpenModal);
	};

	const ImageGalleryModal = () => {
		const onNextClick = () => {
			const nextImageIndex = activeImageIndex === images.length - 1 ? 0 : activeImageIndex + 1;

			activeImageIndex = nextImageIndex;
			setDataForActiveSlide();
		};

		const onBackClick = () => {
			const backImageIndex = activeImageIndex === 0 ? images.length - 1 : activeImageIndex - 1;

			activeImageIndex = backImageIndex;
			setDataForActiveSlide();
		};

		const closeModel = () => {
			const bodyElement = document.getElementsByTagName('body')[0];
			bodyElement.classList.remove(styles.hasOpenModal);

			const { modalElement } = getDomElements();
			modalElement.style.display = 'none';

			activeImageIndex = -1;
			setDataForActiveSlide();
		};

		return (
			<div id={modalElementId} className={styles.modal}>
				<div class={styles.modalContent}>
					<span className={`${styles.controlButton} ${styles.closeButton}`} onclick={closeModel} title="Close Modal">&times;</span>
					<a className={`${styles.controlButton} ${styles.previousButton}`} onclick={onBackClick} title="Previous Slide">&#10094;</a>
					<a className={`${styles.controlButton} ${styles.nextButton}`} onclick={onNextClick} title="Next Slide">&#10095;</a>

					<span id={imageNumberElementId} className={styles.slideNumber}></span>

					<div className={styles.slideContent}>
						<div>
							<img id={activeImageElementId} src='' />
						</div>
					</div>

					<div className={styles.slideCaption}>
						<p id={imageCaptionElementId}></p>
					</div>
				</div>
			</div>
		);
	};

	return [
		ImageGalleryModal,
		openModal
	];
};

export default getConnectedImageGalleryModal;
