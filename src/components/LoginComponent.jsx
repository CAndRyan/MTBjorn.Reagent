import { ReactiveComponent } from '@mtbjorn/hypotenuse/ui';
import styles from './styles/LoginComponent';

const getUserDetailsFromFormData = (formData) => {
	const userDetails = {};

	for (var [key, value] of formData.entries())
        userDetails[key] = value;

	return userDetails;
};

const getOnFormSubmitHandler = (onSubmit, onAfterSuccess) => async (event) => {
	const { target } = event;
	const formData = new FormData(target);
	const userDetails = getUserDetailsFromFormData(formData);

	event.preventDefault();

	try {
		await onSubmit(userDetails);
		target.reset();
        await onAfterSuccess();
		// TODO: display success message
	} catch (error) {
		console.error(error);
		// TODO: display error message
	}
    
	return false;
};

const noOpAsync = () => Promise.resolve();

const LoginComponentBase = ({ onSubmit, onAfterSuccess = noOpAsync }) => (
    <form className={styles.loginForm} onSubmit={getOnFormSubmitHandler(onSubmit, onAfterSuccess)} autocomplete="off">
        <table>
            <tbody>
                <tr>
                    <td>Email</td>
                    <td className={styles.inputColumn}><input type="email" name="email" required placeholder="e.g. someone@email.com" /></td>
                </tr>
                <tr>
                    <td>Password</td>
                    <td className={styles.inputColumn}><input type="password" name="password" required /></td>
                </tr>
            </tbody>
        </table>

        <div className={styles.buttonRow}>
            <button type="submit">Login</button>
        </div>
    </form>
);

const LoginComponent = ({ onSubmit, onAfterSuccess = noOpAsync, getCachedCredentials = noOpAsync }) => {
    let cachedCredentials = null;
    const onBeforeElementRender = async () => {
        cachedCredentials = await getCachedCredentials();
    };
    const onAfterElementRender = async () => {
        if (!cachedCredentials)
            return;

        await onSubmit(cachedCredentials);
        await onAfterSuccess(); // TODO: use explicit error handling or is the form submit failure sufficient?
    };

    return (
        <ReactiveComponent onBeforeElementRender={onBeforeElementRender} onAfterElementRender={onAfterElementRender}>
            <LoginComponentBase onSubmit={onSubmit} onAfterSuccess={onAfterSuccess} />
        </ReactiveComponent>
    );
};

export default LoginComponent;
