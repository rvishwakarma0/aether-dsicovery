// jsdom doesn't implement scrollIntoView
Element.prototype.scrollIntoView = () => {};

import '@testing-library/jest-dom/vitest';

