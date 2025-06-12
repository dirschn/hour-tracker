Rails.application.routes.draw do
  devise_for :users,
             path: '/',
             controllers: {
               sessions: 'users/sessions',
               registrations: 'users/registrations'
             }
  mount Rswag::Ui::Engine => '/api-docs'
  mount Rswag::Api::Engine => '/api-docs'
  resources :time_entries
  resources :hourly_rates
  resources :user_positions
  resources :positions
  resources :companies
  resources :users
  resources :groups
  resource :dashboard, only: [:show]
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get 'up' => 'rails/health#show', as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
