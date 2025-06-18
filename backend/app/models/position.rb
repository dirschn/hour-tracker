class Position < ApplicationRecord
  belongs_to :company

  has_many :employments, dependent: :destroy
  has_many :employees, through: :employments, source: :user
  has_many :shifts, through: :employments

  accepts_nested_attributes_for :company, update_only: true

  validates :title, presence: true, uniqueness: { scope: :company_id }
end
