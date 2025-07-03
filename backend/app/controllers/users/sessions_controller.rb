class Users::SessionsController < Devise::SessionsController
  skip_before_action :authenticate_user!, only: [:create]

  def create
    super do |user|
      if user.persisted?
        render 'users/current', status: :ok and return
      end
    end
  end

  def destroy
    super do
      render json: { message: 'Logged out successfully' }, status: :ok and return
    end
  end

  private

  # Override flash to prevent errors in API mode
  def flash
    {}
  end

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render 'users/current', status: :ok
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def respond_to_on_destroy
    render json: { message: 'Logged out successfully' }, status: :ok
  end

  # Allow remember_me parameter
  def sign_in_params
    params.require(:user).permit(:email, :password, :remember_me)
  end
end
