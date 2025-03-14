# Tridorian UI Application

This is the front-end UI for the Tridorian Assignment project. The application is built using React.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14.x or higher recommended)
- npm (usually comes with Node.js)
- Git (for cloning the repository)

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tridorianAssignment/ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Project Structure

```
ui/
├── public/          # Public assets and index.html
├── src/             # Source files
│   ├── components/  # React components
│   ├── pages/       # Page components
│   ├── services/    # API services
│   ├── styles/      # CSS/SCSS files
│   ├── utils/       # Utility functions
│   ├── App.js       # Main App component
│   └── index.js     # Entry point
└── package.json     # Project dependencies and scripts
```

## Environment Configuration

Create a `.env` file in the root directory with the following variables if needed:

```
REACT_APP_API_URL=http://localhost:8000/api
```

## Additional Resources

- [React Documentation](https://reactjs.org/)
- [Create React App Documentation](https://create-react-app.dev/)

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed correctly
2. Check console for error messages
3. Ensure environment variables are set properly
4. Try deleting `node_modules` and running `npm install` again
