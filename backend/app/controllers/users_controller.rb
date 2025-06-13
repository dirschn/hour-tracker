class UsersController < ApplicationController
  before_action :set_user, only: %i[ show update destroy ]

  def index
    @users = User.all
  end

  def show; end

  def create
    @user = User.new(user_params)

    if @user.save
      render :show, status: :created, location: @user
    else
      render json: { errors: @user.errors }, status: :unprocessable_entity
    end
  end

  def update
    if @user.update(user_params)
      render :show, status: :ok, location: @user
    else
      render json: { errors: @user.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    @user.destroy!
    head :no_content
  end

  private
    def set_user
      @user = User.find(params.expect(:id))
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'User not found' }, status: :not_found
    end

    def user_params
      params.expect(user: [:first_name, :last_name, :username, :email])
    end
end
