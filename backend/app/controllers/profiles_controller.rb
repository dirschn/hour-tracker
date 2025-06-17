class ProfilesController < ApplicationController
  before_action :authenticate_user!

  def show
    @user = current_user.includes(:employments, employments: [:position, position: :company])

    respond_to do |format|
      format.html
      format.json do
        if @user.present?
          render json: @user
        else
          render json: { error: 'User not found' }, status: :not_found
        end
      end
    end
  end

  def update
    if current_user.update(profile_params)
      flash[:notice] = 'Profile updated successfully'
      respond_to do |format|
        format.html { redirect_to profile_path }
        format.json { render json: { message: 'Profile updated successfully' }, status: :ok }
      end
    else
      flash[:alert] = current_user.errors.full_messages.join(', ')
      respond_to do |format|
        format.html { render :show }
        format.json { render json: { error: current_user.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  private

  def profile_params
    params.expect(user: %i[first_name last_name email username])
  end
end
