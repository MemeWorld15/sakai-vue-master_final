<script setup>
import { useLayout } from '@/layout/composables/layout';
import { io } from 'socket.io-client';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const lineData = ref(null);
const lineOptions = ref(null);
const barData = ref(null);
const barOptions = ref(null);

const socket = io('http://localhost:3000'); // Cambia esto a la URL de producción en Vercel

onMounted(() => {
    setColorOptions();
    socket.on('salesData', updateLineData);
    socket.on('customersData', updateBarData);
});

function updateLineData(data) {
    const labels = data.map(item => new Date(item.mes).toLocaleDateString());
    const values = data.map(item => item.totalventas);

    lineData.value = {
        labels: labels,
        datasets: [
            {
                label: 'Total Ventas',
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--p-primary-500'),
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--p-primary-500'),
                data: values,
                fill: false,
                tension: 0.4
            }
        ]
    };
}

function updateBarData(data) {
    const labels = data.map(item => `${item.nombre} ${item.apellidos} (${new Date(item.mes).toLocaleString('default', { month: 'long' })})`);
    const values = data.map(item => item.total_pedidos);

    barData.value = {
        labels: labels,
        datasets: [
            {
                label: 'Total Pedidos',
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--p-primary-500'),
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--p-primary-500'),
                data: values
            }
        ]
    };
}

function setColorOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    lineOptions.value = {
        plugins: {
            legend: {
                labels: {
                    fontColor: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };

    barOptions.value = {
        plugins: {
            legend: {
                labels: {
                    fontColor: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };
}

watch(
    [getPrimary, getSurface, isDarkTheme],
    () => {
        setColorOptions();
    },
    { immediate: true }
);
</script>

<template>
    <Fluid class="grid grid-cols-12 gap-8">
        <div class="col-span-12 xl:col-span-6">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Linear</div>
                <Chart type="line" :data="lineData" :options="lineOptions"></Chart>
            </div>
        </div>
        <div class="col-span-12 xl:col-span-6">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Bar</div>
                <Chart type="bar" :data="barData" :options="barOptions"></Chart>
            </div>
        </div>
    </Fluid>
</template>
