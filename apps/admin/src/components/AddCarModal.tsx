import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '@srd/config';
import { createVehicle, usdToMinorUzs, type Vehicle } from '../lib/api';

const CATEGORIES: [Vehicle['category'], string][] = [
  ['ECONOMY', 'Economy'],
  ['SEDAN', 'Sedan'],
  ['SUV', 'SUV'],
  ['SEVEN_SEATER', '7-seater'],
  ['ELECTRIC', 'Electric'],
];
const FEATURES = ['Air conditioning', 'GPS', 'Bluetooth', 'Child seat', 'Sunroof', 'USB-C', 'Cruise control', 'All-wheel drive'];

export function AddCarModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const qc = useQueryClient();
  const [makeModel, setMakeModel] = useState('');
  const [category, setCategory] = useState<Vehicle['category']>('SEDAN');
  const [transmission, setTransmission] = useState<Vehicle['transmission']>('AUTOMATIC');
  const [seats, setSeats] = useState(5);
  const [year, setYear] = useState(2024);
  const [plate, setPlate] = useState('');
  const [priceUsd, setPriceUsd] = useState(40);
  const [feats, setFeats] = useState<string[]>(['Air conditioning', 'Bluetooth']);

  const mutation = useMutation({
    mutationFn: () => {
      const trimmed = makeModel.trim();
      const make = trimmed.split(' ')[0] || trimmed;
      const model = trimmed.split(' ').slice(1).join(' ') || trimmed;
      return createVehicle({
        make,
        model,
        year,
        category,
        transmission,
        seats,
        plate: plate || undefined,
        dailyRateUzs: usdToMinorUzs(priceUsd),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-vehicles'] });
      onSaved('Car saved to your fleet');
      onClose();
      setMakeModel('');
      setPlate('');
    },
  });

  const field = { fullWidth: true, size: 'small' as const };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: colors.bg2, border: `1px solid ${colors.lineAdmin}`, borderRadius: '20px' } }}>
      <DialogTitle sx={{ fontFamily: '"Bricolage Grotesque"', fontWeight: 800 }}>
        Add a car to your fleet
        <Typography sx={{ color: colors.mutedAdmin, fontSize: 13, mt: 0.5 }}>
          Details, photos and availability
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1 }}>
          <TextField {...field} sx={{ gridColumn: 'span 2' }} label="Make & model" placeholder="e.g. Chevrolet Cobalt"
            value={makeModel} onChange={(e) => setMakeModel(e.target.value)} />
          <TextField {...field} select label="Category" value={category}
            onChange={(e) => setCategory(e.target.value as Vehicle['category'])}>
            {CATEGORIES.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
          </TextField>
          <TextField {...field} select label="Transmission" value={transmission}
            onChange={(e) => setTransmission(e.target.value as Vehicle['transmission'])}>
            <MenuItem value="AUTOMATIC">Automatic</MenuItem>
            <MenuItem value="MANUAL">Manual</MenuItem>
          </TextField>
          <TextField {...field} type="number" label="Seats" value={seats}
            onChange={(e) => setSeats(Number(e.target.value))} />
          <TextField {...field} type="number" label="Year" value={year}
            onChange={(e) => setYear(Number(e.target.value))} />
          <TextField {...field} label="Plate number" placeholder="01 A 123 BC" value={plate}
            onChange={(e) => setPlate(e.target.value)} />
          <TextField {...field} type="number" label="Daily price (USD)" value={priceUsd}
            onChange={(e) => setPriceUsd(Number(e.target.value))}
            helperText={`Charged in UZS · ~${(usdToMinorUzs(priceUsd) / 100).toLocaleString('ru-RU')} so'm`} />
        </Box>

        <Typography sx={{ color: colors.mutedAdmin, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', mt: 2.5, mb: 1 }}>
          Features
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {FEATURES.map((f) => {
            const on = feats.includes(f);
            return (
              <Chip key={f} label={f} onClick={() => setFeats((p) => (on ? p.filter((x) => x !== f) : [...p, f]))}
                sx={{
                  cursor: 'pointer', fontWeight: 600,
                  color: on ? colors.gold : colors.cream,
                  bgcolor: on ? 'rgba(224,169,59,.14)' : colors.surf,
                  border: `1px solid ${on ? colors.gold : colors.lineAdmin}`,
                }} />
            );
          })}
        </Stack>

        {mutation.isError && (
          <Typography sx={{ color: colors.rose, fontSize: 13, mt: 2 }}>
            {(mutation.error as Error).message}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: colors.cream }}>Cancel</Button>
        <Button variant="contained" onClick={() => mutation.mutate()} disabled={mutation.isPending || !makeModel.trim()}
          sx={{ textTransform: 'none', fontWeight: 700 }}>
          {mutation.isPending ? 'Saving…' : 'Save car to fleet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
