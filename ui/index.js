import { renderElementAsAppend } from '@mtbjorn/hypotenuse/ui';
import { LoginComponent } from '../src/index';

const handleLogin = async (userDetails) => {
    console.log(userDetails);
};

const onAfterLoginSuccess = async () => {
    console.log('SUCCESS');
};

const renderTestUi = (parentElementId) => {
    renderElementAsAppend(<LoginComponent onSubmit={handleLogin} onAfterSuccess={onAfterLoginSuccess} />, parentElementId);
};

export {
    renderTestUi
};
