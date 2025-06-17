class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :username, null: false, index: { unique: true }, limit: 20
      t.string :email, null: false, index: { unique: true }

      t.timestamps
    end
  end
end
