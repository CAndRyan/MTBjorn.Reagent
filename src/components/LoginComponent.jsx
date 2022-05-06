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

	try {
		await onSubmit(userDetails);
		target.reset();
        await onAfterSuccess();
		// TODO: display success message
	} catch (error) {
		console.error(error);
		// TODO: display error message
	}

	event.preventDefault();
	return false;
};

const noOpAsync = () => Promise.resolve();

const LoginComponent = ({ onSubmit, onAfterSuccess = noOpAsync }) => (
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

export default LoginComponent;
