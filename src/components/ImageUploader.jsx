import { v4 as uuidv4 } from 'uuid';
import { resizeImage } from '@mtbjorn/hypotenuse/utility';
import styles from './styles/ImageUploader';

const fileIsValidImage = ({ type: mimeType }) => {
	const [mainFileType, subType] = mimeType.split('/');

	if (mainFileType !== 'image')
		return false;

	return subType !== 'x-icon'; // i.e. ignore *.ico files
};

const imageCanBeResized = ({ type: mimeType }) => {
	const [_, fileSubType] = mimeType.split('/');
	return fileSubType !== 'gif'; // NOTE: the current resizing approach only works for static images
};

const defaultUploadFailureHandler = async (errors) => {
	errors.forEach((error) => {
		console.error(error);
	});

	return Promise.resolve();
};

const ImageUploader = ({ title, disabled, handleFileUpload, onUploadFailure = defaultUploadFailureHandler, maxFileSizeMb = 10 }) => {
	const maxFileSizeKb = maxFileSizeMb * 1000;
	const loaderElementId = uuidv4();

	const handleFileListUpload = async ({ target }) => {
		document.getElementById(loaderElementId).style.display = 'inline-block';

		try {
			const fileList = target.files;
			const fileUploadTasks = [];

			for (let i = 0; i < fileList.length; i++) {
				const currentFile = fileList[i];
				if (!fileIsValidImage(currentFile)) {
					const deferredFailureTask = Promise.reject(`File '${currentFile.name}' is not an accepted image type (${currentFile.type})`);
					fileUploadTasks.push(deferredFailureTask);
					continue;
				}

				if (currentFile.size / 1000 > maxFileSizeKb && !imageCanBeResized(currentFile)) {
					const deferredFailureTask = Promise.reject(`File '${currentFile.name}' (${currentFile.size / 1000} kb) exceeds size restriction (${maxFileSizeMb} mb) & is an image type (${currentFile.type}) that cannot be resized`);
					fileUploadTasks.push(deferredFailureTask);
					continue;
				}

				const resizedImageFile = await resizeImage(currentFile, maxFileSizeKb);
				if (!resizedImageFile.size / 1000 > maxFileSizeKb) {
					const deferredFailureTask = Promise.reject(`Failed to resize file '${currentFile.name}' (original=${currentFile.size / 1000} kb, resized=${resizedImageFile.size / 1000} kb) below ${maxFileSizeMb} mb threshold`);
					fileUploadTasks.push(deferredFailureTask);
					continue;
				}

				const task = handleFileUpload(resizedImageFile);
				fileUploadTasks.push(task);
			}

			const results = await Promise.allSettled(fileUploadTasks);
			const failureReasons = results.filter(({ status }) => status == 'rejected').map(({ reason }) => reason);

			if (failureReasons.length > 0)
				onUploadFailure(failureReasons);
		}
		catch (error) {
			defaultUploadFailureHandler([error]);
		}
		finally {
			document.getElementById(loaderElementId).style.display = 'none';
		}
	};

	return (
		<div class={styles.imageUpload}>
			<div id={loaderElementId} class={styles.loadingSpinnerContainer}>
				<div class={styles.loadingSpinner} />
			</div>
			<label>
				Upload image(s):&nbsp;
				<input type="file" multiple onChange={handleFileListUpload} title={title} disabled={disabled} />
			</label>
		</div>
	);
};

export default ImageUploader;
