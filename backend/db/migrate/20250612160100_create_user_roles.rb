class CreateUserRoles < ActiveRecord::Migration[6.1]
  def change
    create_table :user_roles do |t|
      t.references :user, null: false, foreign_key: true
      t.references :role, null: false, foreign_key: true
      t.references :company, null: false, foreign_key: true
      t.timestamps
    end
    add_index :user_roles, [:user_id, :role_id, :company_id], unique: true
  end
end
