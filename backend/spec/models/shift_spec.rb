require 'rails_helper'

RSpec.describe Shift, type: :model do
  describe '.hours_worked' do
    subject(:hours_worked) { shift.hours_worked }

    let(:shift) { create(:shift, start_time:, end_time:, employment:) }
    let(:employment) { create(:employment, round_mode:, round_interval:) }
    let(:round_interval) { nil } # Only used for custom rounding

    context 'when round_mode is exact' do
      let(:round_mode) { :exact }

      context 'with no end_time (active shift)' do
        let(:start_time) { 2.hours.ago - 8.minutes }
        let(:end_time) { nil }

        it 'calculates hours worked up to current time' do
          expect(hours_worked).to be 2.13
        end
      end

      context 'with end_time set' do
        let(:start_time) { 3.hours.ago - 30.minutes }
        let(:end_time) { 26.minutes.ago }

        it 'calculates exact hours worked' do
          expect(hours_worked).to eq(3.07)
        end

        context 'with short shifts' do
          let(:start_time) { 45.minutes.ago }
          let(:end_time) { 15.minutes.ago }

          it 'calculates exact hours for 30 minute shift' do
            expect(hours_worked).to eq(0.5)
          end
        end

        context 'with partial hour shifts' do
          let(:start_time) { 1.hour.ago - 23.minutes }
          let(:end_time) { 7.minutes.ago }

          it 'calculates exact hours for 1h 16min shift' do
            expect(hours_worked).to eq(1.27)
          end
        end

        context 'with very long shifts' do
          let(:start_time) { 12.hours.ago - 45.minutes }
          let(:end_time) { 30.minutes.ago }

          it 'calculates exact hours for 12h 15min shift' do
            expect(hours_worked).to eq(12.25)
          end
        end
      end
    end

    context 'when round_mode is quarter_hour' do
      let(:round_mode) { 'quarter_hour' }

      context 'with no end_time (active shift)' do
        let(:start_time) { 2.hours.ago - 8.minutes }
        let(:end_time) { nil }

        it 'calculates hours worked rounded to nearest quarter hour' do
          expect(hours_worked).to eq(2.25)
        end
      end

      context 'with end_time set' do
        let(:start_time) { 3.hours.ago - 30.minutes }
        let(:end_time) { 26.minutes.ago }

        it 'calculates hours worked rounded to nearest quarter hour' do
          expect(hours_worked).to eq(3.0)
        end

        context 'with edge cases around 7.5 minute mark' do
          let(:start_time) { 1.hour.ago - 7.minutes }
          let(:end_time) { Time.current }

          it 'rounds down to nearest quarter when under 7.5 minutes' do
            expect(hours_worked).to eq(1.0)
          end
        end

        context 'with edge cases around 7.5 minute mark (round up)' do
          let(:start_time) { 1.hour.ago - 8.minutes }
          let(:end_time) { Time.current }

          it 'rounds up to nearest quarter when over 7.5 minutes' do
            expect(hours_worked).to eq(1.25)
          end
        end

        context 'with short shifts under 15 minutes' do
          let(:start_time) { 10.minutes.ago }
          let(:end_time) { Time.current }

          it 'rounds 10 minutes to 0.25 hours' do
            expect(hours_worked).to eq(0.25)
          end
        end

        context 'with shifts ending on exact quarter hours' do
          let(:start_time) { 1.hour.ago - 30.minutes }
          let(:end_time) { Time.current }

          it 'maintains exact quarter hour when already aligned' do
            expect(hours_worked).to eq(1.5)
          end
        end
      end
    end

    context 'when round_mode is half_hour' do
      let(:round_mode) { 'half_hour' }

      context 'with no end_time (active shift)' do
        let(:start_time) { 2.hours.ago - 15.minutes }
        let(:end_time) { nil }

        it 'calculates hours worked rounded to nearest half hour' do
          expect(hours_worked).to eq(2.5)
        end
      end

      context 'with end_time set' do
        let(:start_time) { 3.hours.ago - 30.minutes }
        let(:end_time) { 26.minutes.ago }

        it 'calculates hours worked rounded to nearest half hour' do
          expect(hours_worked).to eq(3.0)
        end

        context 'with edge cases around 15 minute mark' do
          let(:start_time) { 1.hour.ago - 14.minutes }
          let(:end_time) { Time.current }

          it 'rounds down to nearest half hour when under 15 minutes' do
            expect(hours_worked).to eq(1.0)
          end
        end

        context 'with edge cases around 15 minute mark (round up)' do
          let(:start_time) { 1.hour.ago - 16.minutes }
          let(:end_time) { Time.current }

          it 'rounds up to nearest half hour when over 15 minutes' do
            expect(hours_worked).to eq(1.5)
          end
        end

        context 'with short shifts under 30 minutes' do
          let(:start_time) { 20.minutes.ago }
          let(:end_time) { Time.current }

          it 'rounds 20 minutes to 0.5 hours' do
            expect(hours_worked).to eq(0.5)
          end
        end

        context 'with very short shifts' do
          let(:start_time) { 10.minutes.ago }
          let(:end_time) { Time.current }

          it 'rounds 10 minutes to 0 hours' do
            expect(hours_worked).to eq(0.0)
          end
        end

        context 'with shifts ending on exact half hours' do
          let(:start_time) { 2.hours.ago - 30.minutes }
          let(:end_time) { Time.current }

          it 'maintains exact half hour when already aligned' do
            expect(hours_worked).to eq(2.5)
          end
        end
      end
    end

    context 'when round_mode is custom with 20 minute interval' do
      let(:round_mode) { 'custom' }
      let(:round_interval) { 20 }

      context 'with no end_time (active shift)' do
        let(:start_time) { 2.hours.ago - 9.minutes }
        let(:end_time) { nil }

        it 'calculates hours worked rounded to nearest 20 minutes' do
          expect(hours_worked).to eq(2.0)
        end
      end

      context 'with end_time set' do
        let(:start_time) { 3.hours.ago - 30.minutes }
        let(:end_time) { 26.minutes.ago }

        it 'calculates hours worked rounded to nearest 20 minutes' do
          expect(hours_worked).to eq(3.0)
        end

        context 'with edge cases around 10 minute mark' do
          let(:start_time) { 1.hour.ago - 9.minutes }
          let(:end_time) { Time.current }

          it 'rounds down to nearest 20 minutes when under 10 minutes' do
            expect(hours_worked).to eq(1.0)
          end
        end

        context 'with edge cases around 10 minute mark (round up)' do
          let(:start_time) { 1.hour.ago - 11.minutes }
          let(:end_time) { Time.current }

          it 'rounds up to nearest 20 minutes when over 10 minutes' do
            expect(hours_worked).to eq(1.33)
          end
        end

        context 'with short shifts under 20 minutes' do
          let(:start_time) { 15.minutes.ago }
          let(:end_time) { Time.current }

          it 'rounds 15 minutes to 0.33 hours (20 minutes)' do
            expect(hours_worked).to eq(0.33)
          end
        end

        context 'with very short shifts' do
          let(:start_time) { 5.minutes.ago }
          let(:end_time) { Time.current }

          it 'rounds 5 minutes to 0 hours' do
            expect(hours_worked).to eq(0.0)
          end
        end

        context 'with shifts ending on exact 20 minute intervals' do
          let(:start_time) { 1.hour.ago - 20.minutes }
          let(:end_time) { Time.current }

          it 'maintains exact interval when already aligned' do
            expect(hours_worked).to eq(1.33)
          end
        end
      end
    end

    context 'when round_mode is custom with 10 minute interval' do
      let(:round_mode) { 'custom' }
      let(:round_interval) { 10 }

      context 'with edge cases around 5 minute mark' do
        let(:start_time) { 1.hour.ago - 4.minutes }
        let(:end_time) { Time.current }

        it 'rounds down to nearest 10 minutes when under 5 minutes' do
          expect(hours_worked).to eq(1.0)
        end
      end

      context 'with edge cases around 5 minute mark (round up)' do
        let(:start_time) { 1.hour.ago - 6.minutes }
        let(:end_time) { Time.current }

        it 'rounds up to nearest 10 minutes when over 5 minutes' do
          expect(hours_worked).to eq(1.17)
        end
      end

      context 'with 37 minute shift' do
        let(:start_time) { 37.minutes.ago }
        let(:end_time) { Time.current }

        it 'rounds 37 minutes to 40 minutes (0.67 hours)' do
          expect(hours_worked).to eq(0.67)
        end
      end
    end
  end
end
