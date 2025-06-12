class Users::SessionsController < Devise::SessionsController
  skip_before_action :authenticate_user!, only: [:create]

  def create
    super do |user|
      if user.persisted?
        render json: { user: }, status: :ok and return
      end
    end
  end

  def destroy
    super do
      render json: { message: 'Logged out successfully' }, status: :ok and return
    end
  end

  private

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        user: {
          id: resource.id,
          email: resource.email
        },
      }, status: :ok
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def respond_to_on_destroy
    render json: { message: 'Logged out successfully' }, status: :ok
  end
end
