class ApplicationController < ActionController::API
  include ActionController::MimeResponds
  include ActionController::Cookies
  include Pundit::Authorization

  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :force_json_response

  # Pundit authorization failed handler
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  protected

  def force_json_response
    request.format = :json
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:first_name, :last_name, :username, :email])
    devise_parameter_sanitizer.permit(:account_update, keys: [:first_name, :last_name, :username, :email])
    devise_parameter_sanitizer.permit(:sign_in, keys: [:username, :email, :password])
  end

  # Override Devise's default behavior to return 401 instead of redirecting
  def authenticate_user!
    unless user_signed_in?
      render json: { error: 'You need to sign in or sign up before continuing.' }, status: :unauthorized
    end
  end

  private

  def user_not_authorized
    render json: { error: 'You are not authorized to perform this action' }, status: :forbidden
  end
end
