const ImageFrame = ({ fileId, fileName, url, onClickHandler }) => (
	<img id={fileId} alt={fileName} title={fileName} src={url} onClick={onClickHandler} />
);

export default ImageFrame;
