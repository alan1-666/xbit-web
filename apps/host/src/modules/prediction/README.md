# Module Prediction
This module is responsible for handling all functionalities related to predictions feature in the application. It allows users to make an order for predictions,
view their prediction history, and manage prediction settings.

## Note
This module is currently under development in the host application. It should be moved to another application in the future to adapt to the micro-frontend architecture.
However, after setting up the prediction application, some components don't work as expected such as UI components from `shadcn`.
This is reason why the module is still kept in the host application for now.

## Features
- Authenticated: using same authentication system as the host application.
- Finance: allows user deposit and withdraw funds for making predictions.
- Category: supports multiple categories of predictions, allowing users view events by category.
- Search: users can search for specific predictions using keywords.
- Event: users can view detailed information about each prediction event, make an order, and see the results.
- Portfolio: users can view their prediction history and performance over time.

## Module Structure
- `components/`: Contains reusable UI components specific to the prediction module.
- `hooks/`: Custom React hooks for managing prediction-related state and logic.
- `models/`: TypeScript interfaces and types for prediction data structures.
- `pages/`: Contains the main pages for the prediction module, such as event listing, event details, and user portfolio.
- `services/`: API service functions for interacting with the backend.
- `slices/`: Redux slices for managing prediction-related state.
