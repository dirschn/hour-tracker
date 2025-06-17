Rails.application.routes.draw do
  devise_for :users,
             path: '/',
             controllers: {
               sessions: 'users/sessions',
               registrations: 'users/registrations'
             }
  mount Rswag::Ui::Engine => '/api-docs'
  mount Rswag::Api::Engine => '/api-docs'

  resource :dashboard, only: [:show]
  resources :employments do
    member do
      post 'clock_in'
      post 'clock_out'
    end
  end
  resource :profile, only: [:show]
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get 'up' => 'rails/health#show', as: :rails_health_check

  root 'dashboard#show'
end
