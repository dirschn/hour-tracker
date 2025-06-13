class Group < ApplicationRecord
  belongs_to :user
  has_many :shifts, dependent: :nullify

  validates :name, presence: true
  validates :name, uniqueness: { scope: :user_id }
end
